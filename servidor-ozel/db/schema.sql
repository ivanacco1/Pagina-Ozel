-- MySQL Script generated by MySQL Workbench
-- Wed Jun  5 10:59:19 2024
-- Model: New Model    Version: 1.0
-- MySQL Workbench Forward Engineering

SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';

-- -----------------------------------------------------
-- Schema Ozel
-- -----------------------------------------------------

-- -----------------------------------------------------
-- Schema Ozel
-- -----------------------------------------------------
CREATE SCHEMA IF NOT EXISTS `Ozel` DEFAULT CHARACTER SET utf8 ;
USE `Ozel` ;

-- -----------------------------------------------------
-- Table `Ozel`.`Usuarios`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `Ozel`.`Usuarios` (
  `AccountID` INT NOT NULL AUTO_INCREMENT,
  `FirstName` VARCHAR(45) NOT NULL,
  `LastName` VARCHAR(45) NOT NULL,
  `Email` VARCHAR(45) NOT NULL,
  `Password` VARCHAR(60) NOT NULL,
  `Phone` VARCHAR(45) NULL,
  `Address` VARCHAR(45) NULL,
  `City` VARCHAR(45) NULL,
  `PostalCode` VARCHAR(45) NULL,
  `DateRegistered` DATE NULL,
  `Role` VARCHAR(45) NOT NULL DEFAULT 'client',
  PRIMARY KEY (`AccountID`),
  UNIQUE INDEX `Email_UNIQUE` (`Email` ASC) VISIBLE)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `Ozel`.`Productos`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `Ozel`.`Productos` (
  `ProductID` INT NOT NULL AUTO_INCREMENT,
  `Category` VARCHAR(45) NOT NULL,
  `Subcategory` VARCHAR(45) NULL,
  `ProductName` VARCHAR(45) NOT NULL,
  `Description` VARCHAR(45) NULL,
  `Price` DECIMAL(10,2) NOT NULL,
  `Stock` VARCHAR(45) NOT NULL,
  `ImageURL` VARCHAR(90) NULL,
  `DateAdded` DATE NULL,
  `Size` VARCHAR(45) NOT NULL,
  `Color` VARCHAR(45) NOT NULL,
  PRIMARY KEY (`ProductID`))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `Ozel`.`Pedidos`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `Ozel`.`Pedidos` (
  `OrderID` INT NOT NULL AUTO_INCREMENT,
  `OrderDate` DATE NOT NULL,
  `TotalAmount` DECIMAL(10,2) NOT NULL,
  `Status` VARCHAR(45) NOT NULL,
  `Usuarios_AccountID` INT NOT NULL,
  PRIMARY KEY (`OrderID`, `Usuarios_AccountID`),
  INDEX `fk_Pedidos_Usuarios_idx` (`Usuarios_AccountID` ASC) VISIBLE,
  CONSTRAINT `fk_Pedidos_Usuarios`
    FOREIGN KEY (`Usuarios_AccountID`)
    REFERENCES `Ozel`.`Usuarios` (`AccountID`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `Ozel`.`DetallesPedido`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `Ozel`.`DetallesPedido` (
  `OrderDetailID` INT NOT NULL AUTO_INCREMENT,
  `Quantity` INT NOT NULL,
  `UnitPrice` DECIMAL(10,2) NOT NULL,
  `Pedidos_OrderID` INT NOT NULL,
  `Productos_ProductID` INT NOT NULL,
  PRIMARY KEY (`OrderDetailID`, `Pedidos_OrderID`, `Productos_ProductID`),
  INDEX `fk_DetallesPedido_Pedidos1_idx` (`Pedidos_OrderID` ASC) VISIBLE,
  INDEX `fk_DetallesPedido_Productos1_idx` (`Productos_ProductID` ASC) VISIBLE,
  CONSTRAINT `fk_DetallesPedido_Pedidos1`
    FOREIGN KEY (`Pedidos_OrderID`)
    REFERENCES `Ozel`.`Pedidos` (`OrderID`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_DetallesPedido_Productos1`
    FOREIGN KEY (`Productos_ProductID`)
    REFERENCES `Ozel`.`Productos` (`ProductID`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `Ozel`.`Carrito`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `Ozel`.`Carrito` (
  `CartID` INT NOT NULL AUTO_INCREMENT,
  `Quantity` INT NOT NULL,
  `Productos_ProductID` INT NOT NULL,
  `Usuarios_AccountID` INT NOT NULL,
  PRIMARY KEY (`CartID`, `Productos_ProductID`, `Usuarios_AccountID`),
  INDEX `fk_Carrito_Productos1_idx` (`Productos_ProductID` ASC) VISIBLE,
  INDEX `fk_Carrito_Usuarios1_idx` (`Usuarios_AccountID` ASC) VISIBLE,
  CONSTRAINT `fk_Carrito_Productos1`
    FOREIGN KEY (`Productos_ProductID`)
    REFERENCES `Ozel`.`Productos` (`ProductID`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_Carrito_Usuarios1`
    FOREIGN KEY (`Usuarios_AccountID`)
    REFERENCES `Ozel`.`Usuarios` (`AccountID`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `Ozel`.`Pagos`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `Ozel`.`Pagos` (
  `PaymentID` INT NOT NULL AUTO_INCREMENT,
  `PaymentDate` DATE NOT NULL,
  `Amount` DECIMAL(20,2) NOT NULL,
  `PaymentMethod` VARCHAR(45) NOT NULL,
  `Status` VARCHAR(45) NOT NULL,
  `Pedidos_OrderID` INT NOT NULL,
  PRIMARY KEY (`PaymentID`, `Pedidos_OrderID`),
  INDEX `fk_Pagos_Pedidos1_idx` (`Pedidos_OrderID` ASC) VISIBLE,
  CONSTRAINT `fk_Pagos_Pedidos1`
    FOREIGN KEY (`Pedidos_OrderID`)
    REFERENCES `Ozel`.`Pedidos` (`OrderID`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `Ozel`.`Envios`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `Ozel`.`Envios` (
  `ShipmentID` INT NOT NULL AUTO_INCREMENT,
  `ShipmentDate` DATE NOT NULL,
  `Carrier` VARCHAR(45) NOT NULL,
  `TrackingNumber` VARCHAR(45) NOT NULL,
  `Pagos_PaymentID` INT NOT NULL,
  PRIMARY KEY (`ShipmentID`, `Pagos_PaymentID`),
  INDEX `fk_Envios_Pagos1_idx` (`Pagos_PaymentID` ASC) VISIBLE,
  CONSTRAINT `fk_Envios_Pagos1`
    FOREIGN KEY (`Pagos_PaymentID`)
    REFERENCES `Ozel`.`Pagos` (`PaymentID`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;

INSERT INTO Usuarios (FirstName, LastName, Email, Password, Role)
VALUES ('Admin', 'Admin', 'admin@example.com', 'Admin2024*', 'admin');